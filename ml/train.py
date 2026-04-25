# """
# AgriVision - train.py
# Trains MobileNetV2 on your AgriVision_Dataset folder.

# Expected structure:
#   AGRI/
#     AgriVision_Dataset/
#       train/
#         early_blight/
#         healthy/
#         late_blight/
#         leaf_spot/
#       val/
#         early_blight/
#         healthy/
#         late_blight/
#         leaf_spot/
#     ml/
#       train.py   ← this file
# """

# import os, sys, copy, json
# import torch
# import torch.nn as nn
# import torch.optim as optim
# from torch.utils.data import DataLoader, WeightedRandomSampler
# from torchvision import datasets, models, transforms
# import matplotlib.pyplot as plt
# from collections import Counter

# # ═══════════════════════════════════════════
# #   PATHS
# # ═══════════════════════════════════════════
# ML_DIR    = os.path.dirname(os.path.abspath(__file__))
# ROOT_DIR  = os.path.join(ML_DIR, '..')
# DATA_DIR  = os.path.join(ROOT_DIR, 'AgriVision_Dataset')
# TRAIN_DIR = os.path.join(DATA_DIR, 'train')
# VAL_DIR   = os.path.join(DATA_DIR, 'val')
# MODEL_OUT  = os.path.join(ML_DIR, 'model.pth')
# LABELS_OUT = os.path.join(ML_DIR, 'class_labels.json')

# # ═══════════════════════════════════════════
# #   CONFIG
# # ═══════════════════════════════════════════
# IMG_SIZE   = 224
# BATCH_SIZE = 16
# EPOCHS     = 30
# LR         = 3e-4
# DEVICE     = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# print("=" * 55)
# print("  AgriVision — Leaf Disease Training")
# print("=" * 55)
# print(f"  Device    : {DEVICE}")
# print(f"  Train dir : {TRAIN_DIR}")
# print(f"  Val dir   : {VAL_DIR}")
# print("=" * 55)

# # ── Verify folders exist ──
# for d in [TRAIN_DIR, VAL_DIR]:
#     if not os.path.isdir(d):
#         print(f"\n❌ Not found: {d}")
#         sys.exit(1)

# # ═══════════════════════════════════════════
# #   AUGMENTATION
# # ═══════════════════════════════════════════
# train_tf = transforms.Compose([
#     transforms.Resize((IMG_SIZE + 24, IMG_SIZE + 24)),
#     transforms.RandomCrop(IMG_SIZE),
#     transforms.RandomHorizontalFlip(p=0.5),
#     transforms.RandomVerticalFlip(p=0.3),
#     transforms.RandomRotation(degrees=30),
#     transforms.ColorJitter(brightness=0.35, contrast=0.35,
#                            saturation=0.35, hue=0.12),
#     transforms.RandomGrayscale(p=0.08),
#     transforms.RandomPerspective(distortion_scale=0.25, p=0.3),
#     transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 1.0)),
#     transforms.ToTensor(),
#     transforms.Normalize(mean=[0.485, 0.456, 0.406],
#                          std =[0.229, 0.224, 0.225]),
#     transforms.RandomErasing(p=0.2, scale=(0.02, 0.1)),
# ])

# val_tf = transforms.Compose([
#     transforms.Resize((IMG_SIZE, IMG_SIZE)),
#     transforms.ToTensor(),
#     transforms.Normalize(mean=[0.485, 0.456, 0.406],
#                          std =[0.229, 0.224, 0.225]),
# ])

# # ═══════════════════════════════════════════
# #   LOAD DATA
# # ═══════════════════════════════════════════
# def load_data():
#     train_ds = datasets.ImageFolder(TRAIN_DIR, transform=train_tf)
#     val_ds   = datasets.ImageFolder(VAL_DIR,   transform=val_tf)

#     print(f"\n📁 Classes : {train_ds.classes}")
#     print(f"🖼️  Train   : {len(train_ds)} images")
#     print(f"🖼️  Val     : {len(val_ds)} images")

#     counts = Counter(train_ds.targets)
#     print("\n📊 Per-class count:")
#     for i, name in enumerate(train_ds.classes):
#         print(f"   {name:15s} → {counts[i]} images")

#     # Save label map for predict.py
#     with open(LABELS_OUT, 'w') as f:
#         json.dump(train_ds.class_to_idx, f, indent=2)
#     print(f"\n💾 Labels saved → {LABELS_OUT}")

#     # Weighted sampler — prevents class imbalance problems
#     weights = [1.0 / counts[t] for t in train_ds.targets]
#     sampler = WeightedRandomSampler(weights, len(weights), replacement=True)

#     train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE,
#                               sampler=sampler, num_workers=0)
#     val_loader   = DataLoader(val_ds,   batch_size=BATCH_SIZE,
#                               shuffle=False, num_workers=0)

#     return train_loader, val_loader, train_ds.classes


# # ═══════════════════════════════════════════
# #   BUILD MODEL
# # ═══════════════════════════════════════════
# def build_model(num_classes):
#     print("\n🔄 Loading pretrained MobileNetV2...")
#     model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)

#     # Freeze all layers
#     for p in model.parameters():
#         p.requires_grad = False

#     # New classifier head
#     in_f = model.classifier[1].in_features
#     model.classifier = nn.Sequential(
#         nn.Dropout(0.3),
#         nn.Linear(in_f, 256),
#         nn.ReLU(),
#         nn.Dropout(0.2),
#         nn.Linear(256, num_classes),
#     )

#     # Unfreeze last 3 feature blocks
#     for p in model.features[-3:].parameters():
#         p.requires_grad = True

#     model = model.to(DEVICE)
#     trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
#     print(f"✅ Model ready | Trainable params: {trainable:,}")
#     return model


# # ═══════════════════════════════════════════
# #   TRAIN
# # ═══════════════════════════════════════════
# def train(model, train_loader, val_loader):
#     criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
#     optimizer = optim.AdamW(
#         filter(lambda p: p.requires_grad, model.parameters()),
#         lr=LR, weight_decay=1e-4
#     )
#     scheduler = optim.lr_scheduler.CosineAnnealingLR(
#         optimizer, T_max=EPOCHS, eta_min=1e-6
#     )

#     best_acc     = 0.0
#     best_weights = copy.deepcopy(model.state_dict())
#     history      = {"train_loss":[], "train_acc":[], "val_loss":[], "val_acc":[]}

#     print(f"\n🚀 Training — {EPOCHS} epochs on {DEVICE}\n")
#     print(f"{'Ep':>4} {'TrLoss':>8} {'TrAcc':>8} {'VaLoss':>8} {'VaAcc':>8}")
#     print("-" * 45)

#     for epoch in range(EPOCHS):

#         # Unfreeze more layers at epoch 10
#         if epoch == 10:
#             print("\n🔓 Unfreezing deeper layers for fine-tuning...\n")
#             for p in model.features[-6:].parameters():
#                 p.requires_grad = True
#             new_params = [p for p in model.features[-6:].parameters() if p.requires_grad]
#             optimizer.add_param_group({'params': new_params, 'lr': LR * 0.1})

#         # ── Train ──
#         model.train()
#         tl, tc, tt = 0.0, 0, 0
#         for imgs, labels in train_loader:
#             imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)
#             optimizer.zero_grad()
#             out  = model(imgs)
#             loss = criterion(out, labels)
#             loss.backward()
#             torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
#             optimizer.step()
#             tl += loss.item()
#             _, p = torch.max(out, 1)
#             tc += (p == labels).sum().item()
#             tt += labels.size(0)

#         # ── Validate ──
#         model.eval()
#         vl, vc, vt = 0.0, 0, 0
#         with torch.no_grad():
#             for imgs, labels in val_loader:
#                 imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)
#                 out  = model(imgs)
#                 loss = criterion(out, labels)
#                 vl += loss.item()
#                 _, p = torch.max(out, 1)
#                 vc += (p == labels).sum().item()
#                 vt += labels.size(0)

#         scheduler.step()

#         ta = tc / tt * 100
#         va = vc / vt * 100
#         tl /= len(train_loader)
#         vl /= len(val_loader)

#         history["train_loss"].append(tl)
#         history["train_acc"].append(ta)
#         history["val_loss"].append(vl)
#         history["val_acc"].append(va)

#         tag = ""
#         if va > best_acc:
#             best_acc     = va
#             best_weights = copy.deepcopy(model.state_dict())
#             torch.save(best_weights, MODEL_OUT)
#             tag = " ✅"

#         print(f"  {epoch+1:3d}   {tl:7.4f}   {ta:6.2f}%   {vl:7.4f}   {va:6.2f}%{tag}")

#     print("-" * 45)
#     print(f"\n🏆 Best Val Accuracy : {best_acc:.2f}%")
#     print(f"💾 Saved             : {MODEL_OUT}")
#     model.load_state_dict(best_weights)
#     return model, history


# # ═══════════════════════════════════════════
# #   PLOT
# # ═══════════════════════════════════════════
# def plot_results(history, classes):
#     fig, axes = plt.subplots(1, 2, figsize=(13, 5))
#     fig.suptitle(f"Training Results | Classes: {', '.join(classes)}", fontweight='bold')

#     axes[0].plot(history["train_acc"],  label="Train", color="#22c55e", lw=2)
#     axes[0].plot(history["val_acc"],    label="Val",   color="#ef4444", lw=2)
#     axes[0].set_title("Accuracy"); axes[0].set_ylabel("%")
#     axes[0].set_ylim(0, 105); axes[0].legend(); axes[0].grid(alpha=0.3)

#     axes[1].plot(history["train_loss"], label="Train", color="#22c55e", lw=2)
#     axes[1].plot(history["val_loss"],   label="Val",   color="#ef4444", lw=2)
#     axes[1].set_title("Loss")
#     axes[1].legend(); axes[1].grid(alpha=0.3)

#     plt.tight_layout()
#     out = os.path.join(ML_DIR, "training_results.png")
#     plt.savefig(out, dpi=120)
#     print(f"📊 Plot saved → {out}")
#     plt.show()


# # ═══════════════════════════════════════════
# #   MAIN
# # ═══════════════════════════════════════════
# if __name__ == "__main__":
#     train_loader, val_loader, classes = load_data()
#     model = build_model(num_classes=len(classes))
#     model, history = train(model, train_loader, val_loader)
#     plot_results(history, classes)

#     print("\n" + "=" * 55)
#     print("  ✅ Training complete!")
#     print(f"  model.pth    → {MODEL_OUT}")
#     print(f"  class_labels → {LABELS_OUT}")
#     print("  Next: python backend/app.py")
#     print("=" * 55)



"""
AgriVision - train.py
Trains MobileNetV2 on your AgriVision_Dataset folder.

Expected structure:
  AGRI/
    AgriVision_Dataset/
      train/
        early_blight/
        healthy/
        late_blight/
        leaf_spot/
      val/
        early_blight/
        healthy/
        late_blight/
        leaf_spot/
    ml/
      train.py   ← this file
"""

import os, sys, copy, json
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, WeightedRandomSampler
from torchvision import datasets, models, transforms
import matplotlib.pyplot as plt
from collections import Counter

# ═══════════════════════════════════════════
#   PATHS
# ═══════════════════════════════════════════
ML_DIR    = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR  = os.path.join(ML_DIR, '..')
DATA_DIR  = os.path.join(ROOT_DIR, 'AgriVision_Dataset')
TRAIN_DIR = os.path.join(DATA_DIR, 'train')
VAL_DIR   = os.path.join(DATA_DIR, 'val')
MODEL_OUT  = os.path.join(ML_DIR, 'model.pth')
LABELS_OUT = os.path.join(ML_DIR, 'class_labels.json')

# ═══════════════════════════════════════════
#   CONFIG
# ═══════════════════════════════════════════
IMG_SIZE   = 224
BATCH_SIZE = 16
EPOCHS     = 30
LR         = 3e-4
DEVICE     = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

print("=" * 55)
print("  AgriVision — Leaf Disease Training")
print("=" * 55)
print(f"  Device    : {DEVICE}")
print(f"  Train dir : {TRAIN_DIR}")
print(f"  Val dir   : {VAL_DIR}")
print("=" * 55)

# ── Verify folders exist ──
for d in [TRAIN_DIR, VAL_DIR]:
    if not os.path.isdir(d):
        print(f"\n❌ Not found: {d}")
        sys.exit(1)

# ═══════════════════════════════════════════
#   AUGMENTATION
# ═══════════════════════════════════════════
train_tf = transforms.Compose([
    transforms.Resize((IMG_SIZE + 24, IMG_SIZE + 24)),
    transforms.RandomCrop(IMG_SIZE),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomVerticalFlip(p=0.3),
    transforms.RandomRotation(degrees=30),
    transforms.ColorJitter(brightness=0.35, contrast=0.35,
                           saturation=0.35, hue=0.12),
    transforms.RandomGrayscale(p=0.08),
    transforms.RandomPerspective(distortion_scale=0.25, p=0.3),
    transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 1.0)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std =[0.229, 0.224, 0.225]),
    transforms.RandomErasing(p=0.2, scale=(0.02, 0.1)),
])

val_tf = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std =[0.229, 0.224, 0.225]),
])

# ═══════════════════════════════════════════
#   LOAD DATA
# ═══════════════════════════════════════════
def load_data():
    train_ds = datasets.ImageFolder(TRAIN_DIR, transform=train_tf)
    val_ds   = datasets.ImageFolder(VAL_DIR,   transform=val_tf)

    print(f"\n📁 Classes : {train_ds.classes}")
    print(f"🖼️  Train   : {len(train_ds)} images")
    print(f"🖼️  Val     : {len(val_ds)} images")

    counts = Counter(train_ds.targets)
    print("\n📊 Per-class count:")
    for i, name in enumerate(train_ds.classes):
        print(f"   {name:15s} → {counts[i]} images")

    # Save label map for predict.py
    with open(LABELS_OUT, 'w') as f:
        json.dump(train_ds.class_to_idx, f, indent=2)
    print(f"\n💾 Labels saved → {LABELS_OUT}")

    # Weighted sampler — prevents class imbalance problems
    weights = [1.0 / counts[t] for t in train_ds.targets]
    sampler = WeightedRandomSampler(weights, len(weights), replacement=True)

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE,
                              sampler=sampler, num_workers=0)
    val_loader   = DataLoader(val_ds,   batch_size=BATCH_SIZE,
                              shuffle=False, num_workers=0)

    return train_loader, val_loader, train_ds.classes


# ═══════════════════════════════════════════
#   BUILD MODEL
# ═══════════════════════════════════════════
def build_model(num_classes):
    print("\n🔄 Loading pretrained MobileNetV2...")
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)

    # Freeze all layers
    for p in model.parameters():
        p.requires_grad = False

    # New classifier head
    in_f = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(in_f, 256),
        nn.ReLU(),
        nn.Dropout(0.2),
        nn.Linear(256, num_classes),
    )

    # Unfreeze last 3 feature blocks
    for p in model.features[-3:].parameters():
        p.requires_grad = True

    model = model.to(DEVICE)
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"✅ Model ready | Trainable params: {trainable:,}")
    return model


# ═══════════════════════════════════════════
#   TRAIN
# ═══════════════════════════════════════════
def train(model, train_loader, val_loader):
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = optim.AdamW(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=LR, weight_decay=1e-4
    )
    scheduler = optim.lr_scheduler.CosineAnnealingLR(
        optimizer, T_max=EPOCHS, eta_min=1e-6
    )

    best_acc     = 0.0
    best_weights = copy.deepcopy(model.state_dict())
    history      = {"train_loss":[], "train_acc":[], "val_loss":[], "val_acc":[]}

    print(f"\n🚀 Training — {EPOCHS} epochs on {DEVICE}\n")
    print(f"{'Ep':>4} {'TrLoss':>8} {'TrAcc':>8} {'VaLoss':>8} {'VaAcc':>8}")
    print("-" * 45)

    for epoch in range(EPOCHS):

        # Unfreeze more layers at epoch 10
        if epoch == 20:
            print("\n🔓 Unfreezing deeper layers for fine-tuning...\n")
            for p in model.features[-6:].parameters():
                p.requires_grad = True
            new_params = [p for p in model.features[-6:].parameters() if p.requires_grad]
            optimizer.add_param_group({'params': new_params, 'lr': LR * 0.1})

        # ── Train ──
        model.train()
        tl, tc, tt = 0.0, 0, 0
        for imgs, labels in train_loader:
            imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)
            optimizer.zero_grad()
            out  = model(imgs)
            loss = criterion(out, labels)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            tl += loss.item()
            _, p = torch.max(out, 1)
            tc += (p == labels).sum().item()
            tt += labels.size(0)

        # ── Validate ──
        model.eval()
        vl, vc, vt = 0.0, 0, 0
        with torch.no_grad():
            for imgs, labels in val_loader:
                imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)
                out  = model(imgs)
                loss = criterion(out, labels)
                vl += loss.item()
                _, p = torch.max(out, 1)
                vc += (p == labels).sum().item()
                vt += labels.size(0)

        scheduler.step()

        ta = tc / tt * 100
        va = vc / vt * 100
        tl /= len(train_loader)
        vl /= len(val_loader)

        history["train_loss"].append(tl)
        history["train_acc"].append(ta)
        history["val_loss"].append(vl)
        history["val_acc"].append(va)

        tag = ""
        if va > best_acc:
            best_acc     = va
            best_weights = copy.deepcopy(model.state_dict())
            torch.save(best_weights, MODEL_OUT)
            tag = " ✅"

        print(f"  {epoch+1:3d}   {tl:7.4f}   {ta:6.2f}%   {vl:7.4f}   {va:6.2f}%{tag}")

    print("-" * 45)
    print(f"\n🏆 Best Val Accuracy : {best_acc:.2f}%")
    print(f"💾 Saved             : {MODEL_OUT}")
    model.load_state_dict(best_weights)
    return model, history


# ═══════════════════════════════════════════
#   PLOT
# ═══════════════════════════════════════════
def plot_results(history, classes):
    fig, axes = plt.subplots(1, 2, figsize=(13, 5))
    fig.suptitle(f"Training Results | Classes: {', '.join(classes)}", fontweight='bold')

    axes[0].plot(history["train_acc"],  label="Train", color="#22c55e", lw=2)
    axes[0].plot(history["val_acc"],    label="Val",   color="#ef4444", lw=2)
    axes[0].set_title("Accuracy"); axes[0].set_ylabel("%")
    axes[0].set_ylim(0, 105); axes[0].legend(); axes[0].grid(alpha=0.3)

    axes[1].plot(history["train_loss"], label="Train", color="#22c55e", lw=2)
    axes[1].plot(history["val_loss"],   label="Val",   color="#ef4444", lw=2)
    axes[1].set_title("Loss")
    axes[1].legend(); axes[1].grid(alpha=0.3)

    plt.tight_layout()
    out = os.path.join(ML_DIR, "training_results.png")
    plt.savefig(out, dpi=120)
    print(f"📊 Plot saved → {out}")
    plt.show()


# ═══════════════════════════════════════════
#   MAIN
# ═══════════════════════════════════════════
if __name__ == "__main__":
    train_loader, val_loader, classes = load_data()
    model = build_model(num_classes=len(classes))
    model, history = train(model, train_loader, val_loader)
    plot_results(history, classes)

    print("\n" + "=" * 55)
    print("  ✅ Training complete!")
    print(f"  model.pth    → {MODEL_OUT}")
    print(f"  class_labels → {LABELS_OUT}")
    print("  Next: python backend/app.py")
    print("=" * 55)