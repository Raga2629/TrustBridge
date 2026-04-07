# 🎨 Logo Placement Guide - Quick Reference

## Where to Place Your Logo

```
trustbridge-v2/
└── public/
    └── assets/
        └── logo.png  ← PUT YOUR LOGO HERE
```

## Step-by-Step Instructions

### 1. Locate Your Logo File
Find the TrustBridge logo image file (the colorful bridge icon with text) that you want to use.

### 2. Rename the File
Rename your logo file to exactly: **`logo.png`**

### 3. Place in Assets Folder
Copy the file to: **`trustbridge-v2/public/assets/logo.png`**

### 4. Refresh Browser
Open your TrustBridge application and refresh the page. The logo should now appear in the navbar!

---

## Logo Specifications

### File Requirements:
- **Name**: `logo.png` (must be exact)
- **Format**: PNG (recommended with transparent background)
- **Size**: 80-120px height (will be scaled to 40px)
- **Location**: `trustbridge-v2/public/assets/logo.png`

### Display Settings:
- **Height**: 40px (desktop), 32px (mobile)
- **Width**: Auto (maintains aspect ratio)
- **Position**: Left side of navbar
- **Hover Effect**: Slight scale animation
- **Clickable**: Yes (redirects to dashboard)

---

## Visual Preview

### Desktop Navbar Layout:
```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO]              Dashboard  Bookings  Community  [👤▼]  │
│   ↑                                                    ↑     │
│  LEFT                                               RIGHT    │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Navbar Layout:
```
┌──────────────────────────────┐
│  [LOGO]              [☰]     │
│   ↑                   ↑      │
│  LEFT              RIGHT      │
└──────────────────────────────┘
```

---

## Fallback Behavior

If the logo image is not found or fails to load:
- The navbar will display **"TrustBridge"** as text
- Text color: Professional blue (#0c8ce9)
- Font: Bold, 22px (desktop), 18px (mobile)

---

## Testing Checklist

After placing your logo:

- [ ] Logo appears in navbar on all pages
- [ ] Logo is on the LEFT side
- [ ] Navigation items are on the RIGHT side
- [ ] Logo is clickable and redirects to dashboard
- [ ] Logo has hover effect (slight scale)
- [ ] Logo looks good on desktop (40px height)
- [ ] Logo looks good on mobile (32px height)
- [ ] Logo maintains aspect ratio (not stretched)

---

## Troubleshooting

### Logo Not Showing?

1. **Check file name**: Must be exactly `logo.png` (lowercase)
2. **Check location**: Must be in `trustbridge-v2/public/assets/`
3. **Check file format**: PNG format recommended
4. **Clear browser cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
5. **Check console**: Open browser DevTools → Console for errors

### Logo Looks Blurry?

- Use a higher resolution image (2x or 3x size)
- Recommended: 120px height for crisp display at 40px

### Logo Too Wide?

- The logo will maintain aspect ratio automatically
- If too wide, consider using a more compact version
- Maximum recommended width: 200px

---

## Quick Commands

### Check if file exists:
```bash
# Windows
dir trustbridge-v2\public\assets\logo.png

# Mac/Linux
ls trustbridge-v2/public/assets/logo.png
```

### View in browser:
After placing the file, visit:
```
http://localhost:5173/assets/logo.png
```

If you see your logo, it's correctly placed!

---

## Summary

✅ **File name**: `logo.png`
✅ **Location**: `trustbridge-v2/public/assets/logo.png`
✅ **Format**: PNG with transparent background
✅ **Size**: 80-120px height recommended

That's it! Place your logo and refresh. 🚀
