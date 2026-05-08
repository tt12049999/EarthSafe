# Deploy Streamlit App via Streamlit Community Cloud (Easier Option)

Streamlit Community Cloud is **free** and requires no Docker or GCP setup.
Use this for the Streamlit frontend; keep Cloud Run only for the Flask API.

## Steps

1. **Push your repo to GitHub** (if not already done):
   ```bash
   git remote add origin https://github.com/<your-username>/EarthSafe.git
   git push -u origin master
   ```

2. **Go to** https://share.streamlit.io → Sign in with GitHub → **"New app"**

3. Fill in:
   - Repository: `<your-username>/EarthSafe`
   - Branch: `master`
   - Main file path: `src/app/streamlit_app.py`

4. Click **"Deploy!"** — done in ~2 minutes.

5. You'll get a URL like: `https://earthsafe-<hash>.streamlit.app`
   → Put this in your final slides as the **App URL**.

## Note on models/

`models/` is gitignored by default. You need to either:
- Remove `models/` from `.gitignore` and push the pkl files, **or**
- Add a `requirements.txt` entry and a startup script that re-trains on deploy

**Simplest**: temporarily remove `models/*.pkl` from `.gitignore`, commit, push.
```bash
# In .gitignore, remove or comment out:
# models/*.pkl
# models/*.json
# models/*.ubj

git add models/
git commit -m "chore: include trained model artifacts for deployment"
git push
```
