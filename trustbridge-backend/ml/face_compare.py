import sys
import json
import os
import warnings

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
warnings.filterwarnings("ignore")

import cv2


def get_largest_face_crop_path(img_path):
    img = cv2.imread(img_path)
    if img is None:
        return img_path, False
    gray = cv2.equalizeHist(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY))
    best, best_area = None, 0
    cc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    for scale in [1.05, 1.1, 1.15, 1.2]:
        for (x, y, w, h) in cc.detectMultiScale(gray, scaleFactor=scale, minNeighbors=2, minSize=(15, 15)):
            if w * h > best_area:
                best_area = w * h
                best = (x, y, w, h)
    if best:
        x, y, w, h = best
        pad = int(min(w, h) * 0.20)
        crop = img[max(0, y-pad):y+h+pad, max(0, x-pad):x+w+pad]
        tmp = img_path + "_tmp.jpg"
        cv2.imwrite(tmp, crop)
        return tmp, True
    return img_path, False


def main(id_path, selfie_path):
    id_tmp, id_det = get_largest_face_crop_path(id_path)
    sel_tmp, sel_det = get_largest_face_crop_path(selfie_path)

    try:
        from deepface import DeepFace
        r = DeepFace.verify(
            img1_path=id_tmp,
            img2_path=sel_tmp,
            model_name="VGG-Face",
            detector_backend="opencv",
            enforce_detection=False,
            distance_metric="cosine"
        )
        dist = float(r.get("distance", 1.0))
        thr = float(r.get("threshold", 0.68))
        verified = bool(dist < thr)
        if dist <= thr:
            score = int(round(70 + (1 - dist / thr) * 30))
        else:
            score = int(round(max(0, 69 - ((dist - thr) / (1.0 - thr)) * 69)))
        result = {
            "matchScore": max(0, min(100, score)),
            "matched": verified,
            "distance": round(dist, 4),
            "idFaceDetected": id_det,
            "selfieFaceDetected": sel_det,
            "engine": "DeepFace-VGGFace"
        }
    except Exception as ex:
        result = {"matchScore": 0, "matched": False, "error": str(ex)}
    finally:
        for p in [id_tmp, sel_tmp]:
            if p.endswith("_tmp.jpg"):
                try:
                    os.remove(p)
                except Exception:
                    pass

    sys.stdout.write(json.dumps(result) + "\n")
    sys.stdout.flush()


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.stdout.write(json.dumps({"error": "need 2 args"}) + "\n")
        sys.stdout.flush()
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])