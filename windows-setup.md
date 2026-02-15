Got it ✅ — here is the corrected output as **one single properly formatted Markdown file**, clean and ready to copy-paste into `windows-mkdocs-install-fix.md`.

---

# Fixing MkDocs Installation Errors on Windows

This guide explains how to fix common Windows errors when installing **MkDocs**, such as:

* `WinError 5: Access is denied`
* `WinError 2: The system cannot find the file specified`
* `Failed to write executable`
* `mkdocs is not recognized as a command`

---

## 🚨 Common Errors

### 1️⃣ Access Denied Error

```
ERROR: Could not install packages due to an OSError:
[WinError 5] Access is denied
```

### 2️⃣ File Replacement Error

```
Failed to write executable - trying to use .deleteme logic
```

### 3️⃣ Command Not Found

```
mkdocs : The term 'mkdocs' is not recognized as the name of a cmdlet
```

---

# ✅ Step-by-Step Fix

---

## Step 1 — Close Everything

Close:

* VS Code
* All terminals
* Any running Python processes

---

## Step 2 — Upgrade pip (Very Important)

Open **PowerShell as Administrator** and run:

```powershell
python -m pip install --upgrade pip
```

If you prefer not to use admin mode:

```powershell
python -m pip install --upgrade pip --user
```

Then verify:

```powershell
pip --version
```

---

## Step 3 — Install MkDocs

```powershell
pip install mkdocs
```

If installation succeeds but you see warnings about script location, continue to Step 4.

---

## Step 4 — Fix “mkdocs not recognized”

If this happens:

```
mkdocs : The term 'mkdocs' is not recognized
```

It means the Scripts folder is not in your PATH.

### Add Scripts Folder to PATH

Add this path (adjust username if needed):

```
C:\Users\<YourUsername>\AppData\Roaming\Python\Python310\Scripts
```

### How to Add It

1. Press **Win + S**
2. Search: **Environment Variables**
3. Click **Edit the system environment variables**
4. Click **Environment Variables**
5. Under **User variables**, select **Path**
6. Click **Edit**
7. Click **New**
8. Paste the Scripts path
9. Click OK → OK → OK

Then:

* Close all terminals
* Restart VS Code completely
* Open a new terminal
* Run:

```powershell
mkdocs --version
```

---

# 🔥 Fix File Lock Errors (watchmedo.exe issue)

If you see errors involving:

```
watchmedo.exe
```

Do this:

1. Restart your computer
2. Navigate to:

```
C:\Python310\Scripts\
```

3. Delete:

   * `watchmedo.exe`
   * `watchmedo.exe.deleteme` (if it exists)
4. Run installation again:

```powershell
pip install mkdocs
```

---

# 🚀 Recommended Best Practice (Avoid Future Issues)

Instead of installing globally, use a virtual environment.

Inside your project folder:

```powershell
python -m venv venv
venv\Scripts\activate
pip install mkdocs
```

Benefits:

* No permission issues
* No PATH problems
* No system Python conflicts
* Cleaner development setup

---

# 🧠 Why These Errors Happen

* Python installed in `C:\Python310` requires admin rights
* Windows locks `.exe` files while in use
* Older pip versions fail during upgrades
* `--user` installs scripts outside system PATH

---

# ✅ Verification Checklist

After fixing, run:

```powershell
python --version
pip --version
mkdocs --version
```

If all return versions correctly, your setup is working.

---

# 🎉 Create a New MkDocs Project

```powershell
mkdocs new my-project
cd my-project
mkdocs serve
```

Then open:

```
http://127.0.0.1:8000
```

You now have a fully working MkDocs setup on Windows 🚀
