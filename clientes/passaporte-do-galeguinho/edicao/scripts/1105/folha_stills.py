import cv2, numpy as np, glob, os, sys
d = sys.argv[1]; fs = sorted(glob.glob(os.path.join(d, "[0-9]*.jpg"))); ims = []
for p in fs:
    im = cv2.resize(cv2.imread(p), (270, 480)); cv2.rectangle(im, (0, 0), (70, 22), (0, 0, 0), -1)
    cv2.putText(im, os.path.basename(p)[:-4], (3, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1); ims.append(im)
while len(ims) % 6: ims.append(np.zeros_like(ims[0]))
cv2.imwrite(os.path.join(d, "_folha.jpg"), np.vstack([np.hstack(ims[i:i+6]) for i in range(0, len(ims), 6)]), [cv2.IMWRITE_JPEG_QUALITY, 85])
