using System;
using System.IO;
using System.Collections.Generic;
using System.Globalization;
using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;

public static class Ferr
{
    public static BitmapSource Abre(string p)
    {
        using (var s = File.OpenRead(p))
        {
            var d = BitmapDecoder.Create(s, BitmapCreateOptions.PreservePixelFormat, BitmapCacheOption.OnLoad);
            return new FormatConvertedBitmap(d.Frames[0], PixelFormats.Bgra32, null, 0);
        }
    }

    static void SalvaPng(BitmapSource b, string p)
    {
        var e = new PngBitmapEncoder();
        e.Frames.Add(BitmapFrame.Create(b));
        using (var f = File.Create(p)) e.Save(f);
    }

    static void SalvaJpg(BitmapSource b, string p, int q)
    {
        var e = new JpegBitmapEncoder { QualityLevel = q };
        e.Frames.Add(BitmapFrame.Create(new FormatConvertedBitmap(b, PixelFormats.Bgr24, null, 0)));
        using (var f = File.Create(p)) e.Save(f);
    }

    static Point P(double x, double y) { return new Point(x, y); }

    // Pedaço da foto ampliado com grade (linha a cada 10 px, rótulo a cada 50) pra medir pontos
    public static void Grade(string foto, int x0, int y0, int x1, int y1, double zoom, string saida)
    {
        var img = Abre(foto);
        int W = (int)((x1 - x0) * zoom), H = (int)((y1 - y0) * zoom);
        var dv = new DrawingVisual();
        using (var dc = dv.RenderOpen())
        {
            dc.PushTransform(new ScaleTransform(zoom, zoom));
            dc.PushTransform(new TranslateTransform(-x0, -y0));
            dc.DrawImage(img, new Rect(0, 0, img.PixelWidth, img.PixelHeight));
            dc.Pop(); dc.Pop();
            var fino = new Pen(new SolidColorBrush(Color.FromArgb(90, 0, 160, 255)), 1);
            var grosso = new Pen(new SolidColorBrush(Color.FromArgb(200, 255, 0, 0)), 1.5);
            var tf = new Typeface("Arial");
            for (int x = (int)Math.Ceiling(x0 / 10.0) * 10; x <= x1; x += 10)
            {
                double px = (x - x0) * zoom;
                dc.DrawLine(x % 50 == 0 ? grosso : fino, P(px, 0), P(px, H));
                if (x % 50 == 0) dc.DrawText(new FormattedText(x.ToString(), CultureInfo.InvariantCulture, FlowDirection.LeftToRight, tf, 13, Brushes.Red, 1.0), P(px + 2, 2));
            }
            for (int y = (int)Math.Ceiling(y0 / 10.0) * 10; y <= y1; y += 10)
            {
                double py = (y - y0) * zoom;
                dc.DrawLine(y % 50 == 0 ? grosso : fino, P(0, py), P(W, py));
                if (y % 50 == 0) dc.DrawText(new FormattedText(y.ToString(), CultureInfo.InvariantCulture, FlowDirection.LeftToRight, tf, 13, Brushes.Red, 1.0), P(2, py + 2));
            }
        }
        var rtb = new RenderTargetBitmap(W, H, 96, 96, PixelFormats.Pbgra32);
        rtb.Render(dv);
        SalvaPng(rtb, saida);
    }

    // Recorta a pessoa do fundo branco liso. O fundo é o branco ligado à borda da foto (preenchimento a
    // partir das bordas), assim nada claro de dentro (brilho na pele, estampa) vira buraco. Na borda o
    // branco que ficou nos fios sai da cor (F = (I - (1-a)*branco) / a), pra não fazer halo claro no preto.
    public static void Recorta(string foto, string saida)
    {
        var img = Abre(foto);
        int W = img.PixelWidth, H = img.PixelHeight;
        var px = new byte[W * H * 4];
        img.CopyPixels(px, W * 4, 0);
        // foto que já vem recortada (com transparência): usa o recorte dela
        int transp = 0;
        for (int i = 0; i < W * H; i++) if (px[i * 4 + 3] < 250) transp++;
        if (transp > W * H / 50) { SalvaPng(img, saida); Console.WriteLine("ja recortada: " + saida); return; }
        var dif = new int[W * H];
        for (int i = 0; i < W * H; i++)
            dif[i] = Math.Max(255 - px[i * 4], Math.Max(255 - px[i * 4 + 1], 255 - px[i * 4 + 2]));

        const int CLARO = 60; // até aqui ainda conta como fundo (ou fio misturado com o fundo)
        var fundo = new bool[W * H];
        var fila = new Queue<int>();
        Action<int> semente = i => { if (!fundo[i] && dif[i] <= CLARO) { fundo[i] = true; fila.Enqueue(i); } };
        for (int x = 0; x < W; x++) { semente(x); semente((H - 1) * W + x); }
        for (int y = 0; y < H; y++) { semente(y * W); semente(y * W + W - 1); }
        while (fila.Count > 0)
        {
            int i = fila.Dequeue(); int x = i % W, y = i / W;
            if (x > 0) semente(i - 1);
            if (x < W - 1) semente(i + 1);
            if (y > 0) semente(i - W);
            if (y < H - 1) semente(i + W);
        }

        var outp = new byte[W * H * 4];
        for (int i = 0; i < W * H; i++)
        {
            double a = 1.0;
            if (fundo[i]) a = Math.Max(0, Math.Min(1, (dif[i] - 10) / 50.0));
            if (a <= 0) continue;
            for (int c = 0; c < 3; c++)
            {
                double I = px[i * 4 + c];
                double F = a >= 0.999 ? I : (I - (1 - a) * 255) / Math.Max(a, 0.2);
                outp[i * 4 + c] = (byte)Math.Max(0, Math.Min(255, Math.Round(F)));
            }
            outp[i * 4 + 3] = (byte)Math.Round(a * 255);
        }
        var bmp = BitmapSource.Create(W, H, 96, 96, PixelFormats.Bgra32, null, outp, W * 4);
        SalvaPng(bmp, saida);
    }

    // Slide 1080x1350 no padrão do principal aprovado do carrossel: fundo preto, antes à esquerda e
    // depois à direita, alinhados pelos olhos e no mesmo tamanho (distância entre os olhos = D),
    // pé das fotos sumindo no preto, logo no canto. Sem marcação.
    // olhos: x esquerdo, x direito, y (px da foto). depoisNaFrente: qual fica por cima onde encostam.
    public static void Monta(string antes, double[] oa, string depois, double[] od, string logo,
                             double D, double xa, double xd, double y, double peDe, double peAte,
                             bool depoisNaFrente, string saidaPng, string saidaJpg, double[] mantemAntes,
                             double sombra)
    {
        const int SW = 1080, SH = 1350;
        var A = Abre(antes); var B = Abre(depois); var L = Abre(logo);
        var rtb = new RenderTargetBitmap(SW, SH, 96, 96, PixelFormats.Pbgra32);
        // três camadas: fundo + foto de trás; foto da frente (com sombra leve pra direita, sobre a de trás); pé e logo
        var fundo = new DrawingVisual();
        var frente = new DrawingVisual();
        var topo = new DrawingVisual();
        foreach (var v in new[] { fundo, frente, topo }) RenderOptions.SetBitmapScalingMode(v, BitmapScalingMode.HighQuality);
        if (sombra > 0)
            frente.Effect = new System.Windows.Media.Effects.DropShadowEffect
            { Color = Colors.Black, Direction = 0, ShadowDepth = 7, BlurRadius = 34, Opacity = sombra, RenderingBias = System.Windows.Media.Effects.RenderingBias.Quality };
        using (var dcF = fundo.RenderOpen())
        using (var dcA = frente.RenderOpen())
        using (var dc = topo.RenderOpen())
        {
            dcF.DrawRectangle(Brushes.Black, null, new Rect(0, 0, SW, SH));
            // mantem: polígono (px da foto) do que fica visível; o resto some sem degradê
            Action<DrawingContext, BitmapSource, double[], double, double[]> poe = (d, img, o, cx, mantem) =>
            {
                double s = D / (o[1] - o[0]);
                double mx = (o[0] + o[1]) / 2;
                double ox = cx - mx * s, oy = y - o[2] * s;
                if (mantem != null)
                {
                    var fig = new PathFigure { StartPoint = P(ox + mantem[0] * s, oy + mantem[1] * s), IsClosed = true };
                    for (int k = 2; k < mantem.Length; k += 2) fig.Segments.Add(new LineSegment(P(ox + mantem[k] * s, oy + mantem[k + 1] * s), true));
                    var g = new PathGeometry(); g.Figures.Add(fig);
                    d.PushClip(g);
                }
                d.DrawImage(img, new Rect(ox, oy, img.PixelWidth * s, img.PixelHeight * s));
                if (mantem != null) d.Pop();
            };
            if (depoisNaFrente) { poe(dcF, A, oa, xa, mantemAntes); poe(dcA, B, od, xd, null); }
            else { poe(dcF, B, od, xd, null); poe(dcA, A, oa, xa, mantemAntes); }
            var pe = new LinearGradientBrush { StartPoint = P(0, 0), EndPoint = P(0, 1), MappingMode = BrushMappingMode.Absolute };
            pe.StartPoint = P(0, peDe); pe.EndPoint = P(0, peAte);
            pe.GradientStops.Add(new GradientStop(Color.FromArgb(0, 0, 0, 0), 0));
            pe.GradientStops.Add(new GradientStop(Color.FromArgb(255, 0, 0, 0), 1));
            dc.DrawRectangle(pe, null, new Rect(0, peDe, SW, peAte - peDe));
            dc.DrawRectangle(Brushes.Black, null, new Rect(0, peAte, SW, SH - peAte));
            double lw = 170;
            dc.DrawImage(L, new Rect(40, 38, lw, lw * L.PixelHeight / L.PixelWidth));
        }
        rtb.Render(fundo);
        rtb.Render(frente);
        rtb.Render(topo);
        SalvaPng(rtb, saidaPng);
        if (!string.IsNullOrEmpty(saidaJpg)) SalvaJpg(rtb, saidaJpg, 95);
    }
}
