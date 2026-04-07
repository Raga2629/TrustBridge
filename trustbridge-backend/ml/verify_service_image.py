"""
Service Image Verification using MobileNetV2.
Checks if the uploaded service image matches the service name, category, and description.
"""
import sys, json, os, warnings
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
warnings.filterwarnings("ignore")

# Category -> relevant ImageNet keywords
CATEGORY_KEYWORDS = {
    "Medical": ["hospital","ambulance","stethoscope","syringe","pill","medicine","clinic","doctor","nurse","pharmacy","bandage","mask","microscope","stretcher"],
    "Grocery": ["grocery","supermarket","vegetable","fruit","market","shop","store","basket","cart","bread","milk","banana","apple","orange","tomato","potato","rice","onion"],
    "Food": ["restaurant","food","meal","dish","plate","pizza","burger","sandwich","rice","curry","noodle","soup","salad","cake","bread","kitchen","chef","dining","coffee","tea"],
    "Education": ["school","classroom","book","library","student","teacher","blackboard","whiteboard","pencil","notebook","desk","computer","laptop","college","university"],
    "HomeServices": ["house","home","room","furniture","sofa","bed","kitchen","bathroom","plumber","electrician","carpenter","paint","cleaning","mop","vacuum","repair","tool","wrench","hammer","drill","pipe","wire"],
    "Shopping": ["shop","store","mall","market","clothes","dress","shirt","shoes","bag","jewelry","fashion","retail","boutique","shelf","rack","product"],
    "Beauty": ["salon","beauty","hair","makeup","cosmetic","nail","spa","massage","facial","skin","cream","lipstick","mirror","scissors","comb","brush","barber"],
    "Transport": ["car","bus","auto","taxi","vehicle","truck","bike","motorcycle","van","transport","road","driver","cab","rickshaw","lorry"],
    "Temples": ["temple","church","mosque","shrine","prayer","worship","religious","idol","statue","bell","incense","candle","altar","pillar","dome"],
    "Rentals": ["house","apartment","room","building","flat","property","furniture","vehicle","car","bike","equipment"],
    "Repairs": ["repair","tool","wrench","hammer","drill","screwdriver","machine","engine","motor","electric","wire","pipe","workshop","garage","mechanic"],
    "BankATMs": ["bank","atm","money","cash","finance","building","office","counter","card","machine"],
    "PG": ["room","bed","house","building","hostel","dormitory","apartment","flat","furniture","sofa","kitchen","bathroom"],
    "Gym/Fitness": ["gym","fitness","exercise","workout","dumbbell","barbell","treadmill","machine","sport","muscle","training","yoga","mat","weight","bench"]
}

# These labels mean it's clearly NOT a service image
PERSON_LABELS = ["face","portrait","selfie","human face","person","man","woman","girl","boy"]

def classify_image(image_path):
    import numpy as np
    import tensorflow as tf
    from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
    from tensorflow.keras.preprocessing import image as keras_image

    model = MobileNetV2(weights="imagenet", include_top=True)
    img = keras_image.load_img(image_path, target_size=(224, 224))
    x = keras_image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)
    preds = model.predict(x, verbose=0)
    decoded = decode_predictions(preds, top=15)[0]
    return [(label.lower().replace("_", " "), float(conf)) for _, label, conf in decoded]

def verify_service_image(image_path, service_name, category, description=""):
    try:
        if not os.path.exists(image_path):
            return {"isValid": False, "confidence": 0, "detectedContent": "none", "reason": "Image file not found"}

        predictions = classify_image(image_path)
        top_labels = [label for label, _ in predictions[:5]]
        top_label_str = ", ".join(top_labels[:3])
        top_label = predictions[0][0] if predictions else ""
        top_conf = predictions[0][1] if predictions else 0

        # 1. Check if it's a person/selfie/ID card (clearly wrong)
        for label, conf in predictions[:5]:
            for person_kw in PERSON_LABELS:
                if person_kw in label and conf > 0.15:
                    return {
                        "isValid": False, "confidence": 0,
                        "detectedContent": top_label_str,
                        "reason": f"Image appears to be a person photo (detected: '{label}'). Please upload an actual photo of your {category} service/shop/location."
                    }

        # 2. Check if image matches category keywords
        category_keys = CATEGORY_KEYWORDS.get(category, [])
        service_words = [w for w in service_name.lower().split() if len(w) > 3]
        desc_words = [w for w in description.lower().split() if len(w) > 4]
        all_keywords = category_keys + service_words + desc_words

        best_match_score = 0
        best_match_label = None
        for label, conf in predictions[:15]:
            for keyword in all_keywords:
                if keyword in label or label in keyword:
                    if conf > best_match_score:
                        best_match_score = conf
                        best_match_label = label

        # 3. Decision
        if best_match_score >= 0.03:  # 3%+ match = relevant
            return {
                "isValid": True,
                "confidence": round(best_match_score * 100, 1),
                "detectedContent": top_label_str,
                "reason": f"Image matches '{best_match_label}' which is relevant to {category} service."
            }

        # 4. Image detected something with high confidence but it doesn't match
        if top_conf > 0.40:
            return {
                "isValid": False,
                "confidence": 0,
                "detectedContent": top_label_str,
                "reason": f"Image shows '{top_label}' ({round(top_conf*100)}% confidence) but your service is '{service_name}' in category '{category}'. Please upload a real photo of your actual service/shop."
            }

        # 5. Low confidence detection — allow but flag for admin
        return {
            "isValid": True,
            "confidence": round(best_match_score * 100, 1),
            "detectedContent": top_label_str,
            "reason": f"Image content unclear (detected: {top_label_str}). Admin will review manually."
        }

    except Exception as e:
        return {
            "isValid": True, "confidence": 0,
            "detectedContent": "unknown",
            "reason": f"Auto-verification unavailable. Admin will review manually.",
            "error": str(e)[:200]
        }

if __name__ == "__main__":
    if len(sys.argv) < 4:
        sys.stdout.write(json.dumps({"error": "Usage: verify_service_image.py <image> <service_name> <category> [description]"}) + "\n")
        sys.stdout.flush()
        sys.exit(1)
    desc = sys.argv[4] if len(sys.argv) > 4 else ""
    result = verify_service_image(sys.argv[1], sys.argv[2], sys.argv[3], desc)
    sys.stdout.write(json.dumps(result) + "\n")
    sys.stdout.flush()