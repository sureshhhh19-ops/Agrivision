import os
import shutil
import random

source = r"C:\Users\ACER\Downloads\archive\PlantVillage"
target = r"C:\Users\ACER\Desktop\AGRI\AgriVision_Dataset"

limit_per_class = 500

classes = {
    "healthy": "Potato___healthy",
    "early_blight": "Potato___Early_blight",
    "late_blight": "Potato___Late_blight",
    "leaf_spot": "Tomato_Bacterial_spot"   # ✅ FIXED
}

for new_class, old_class in classes.items():
    src_path = os.path.join(source, old_class)
    dst_path = os.path.join(target, new_class)

    os.makedirs(dst_path, exist_ok=True)

    if not os.path.exists(src_path):
        print(f"❌ Folder not found: {src_path}")
        continue

    files = os.listdir(src_path)

    # Optional: filter only images
    files = [f for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

    selected = random.sample(files, min(limit_per_class, len(files)))

    for file in selected:
        shutil.copy(os.path.join(src_path, file), dst_path)

    print(f"✅ {new_class}: {len(selected)} images copied")

print("🎉 Dataset ready!")