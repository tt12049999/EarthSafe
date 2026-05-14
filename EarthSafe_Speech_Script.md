# EarthSafe — Final Presentation Speech Script
# STAT 418 · UCLA · Spring 2026 · Yutong Ma
# Total time: ~10–12 minutes

---

## Slide 1 — Title (30 seconds)

Hi everyone. My name is Yutong Ma, and my final project is called **EarthSafe** — a real-time earthquake hazard prediction app.

The idea is simple: given a few seismic parameters, the app tells you whether an earthquake is Low, Moderate, or High hazard — instantly, in plain language anyone can understand.

Today I'll walk you through the data, the model, the app, and the deployment. Let's get started.

---

## Slide 2 — Project Overview & Motivation (1.5 minutes)

So why earthquakes?

Every year, there are about 55,000 earthquakes with magnitude 2.5 or above globally. The data is publicly available through the USGS — the US Geological Survey — but it's raw, technical, and hard to act on without domain expertise.

EarthSafe bridges that gap. Instead of showing a raw magnitude number, it outputs a clear hazard level: **Green for Low, Yellow for Moderate, Red for High**.

On the right, you can see how we define those levels:
- **Low** is anything below magnitude 4.0 — minor shaking, rarely felt.
- **Moderate** covers 4.0 to 6.0 — widely felt, possible minor damage.
- **High** is 6.0 and above — strong shaking, significant damage risk.

These thresholds are consistent with USGS reporting conventions and standard seismic hazard literature.

For the model, I used **5 input features**: magnitude, depth, azimuthal gap, RMS travel time residual, and location type — whether the earthquake was inland or offshore.

---

## Slide 3 — Data Collection & Preprocessing (2 minutes)

Let me walk through the data pipeline.

**Step 01 — Fetch.** I pulled data from the USGS Earthquake Hazards Program API using Python's requests library. To stay within the API's 20,000-record-per-request limit, I fetched data in monthly chunks across the full years 2023 and 2024.

**Step 02 — Feature engineering.** I derived the `location_type` feature from the `place` field — if the description includes "of " it's offshore, otherwise inland. For the `gap` column, which had 103 missing values, I imputed with the median.

**Step 03 — Labeling.** The hazard labels are rule-based: magnitude drives the label directly. This is intentional — in production, we want the model to learn that relationship *and* capture how other features like depth and gap modify the risk pattern.

**Step 04 — Splitting.** I used stratified k-fold cross-validation — stratified because of the class imbalance you can see in this pie chart.

Looking at the chart on the right: the dataset is 52% Low, 48% Moderate — fairly balanced between those two. But **High has only 7 records**. Magnitude 6+ events are genuinely rare in a 2-year window. I addressed this with sample weight balancing during training, which I'll explain in a moment.

---

## Slide 4 — Model Development & Evaluation (2.5 minutes)

I trained and compared three models: Logistic Regression, Random Forest, and XGBoost — all evaluated with 5-fold cross-validation.

Looking at the bar chart, the results are clear:

**Logistic Regression** achieves 97.1% accuracy but its Macro F1 is only 86.1% — it struggles with the rare High class.

**Random Forest** jumps to 99.9% accuracy and 94.4% Macro F1 — much better on the High class.

**XGBoost** is the winner at 99.95% accuracy and Macro F1 of 1.00 — it correctly classified all 7 High-hazard events across all 5 folds.

The key was using `compute_sample_weight("balanced")` to up-weight the rare class, combined with XGBoost's native gradient boosting which iteratively focuses on harder examples.

On the right, you can see the **feature importance** from the trained model. Magnitude dominates at 82% — which makes sense since it directly determines the label. Depth comes second at 7%, followed by gap, RMS, and location type. The model is learning the right signal.

For deployment, I trained XGBoost on the full 2,000-record dataset and serialized it with joblib.

---

## Slide 5 — Solution Architecture (1.5 minutes)

Here's the full system architecture — 6 stages from data to user.

**Stage 1 — Ingest.** The USGS API feeds raw earthquake data into the collection script.

**Stage 2 — Process.** Pandas handles feature engineering and cleaning. Scikit-learn handles preprocessing.

**Stage 3 — Train.** The XGBoost model is trained on the processed data and saved as a `.pkl` file.

**Stage 4 — Serve.** A Flask REST API loads the model and exposes two endpoints: `POST /predict` for on-demand predictions, and `GET /recent` which proxies the USGS API for live earthquake data.

**Stage 5 — Visualize.** The Streamlit frontend calls both the Flask API and the USGS feed to power the interactive UI.

**Stage 6 — Deploy.** Everything is containerized with Docker and deployed to Google Cloud Run — serverless, auto-scaling, and accessible from any browser.

The tech stack: Python 3.11, XGBoost 2.0, Flask 3.0, Streamlit 1.35, Plotly for the map, Docker, and Google Cloud Run.

---

## Slide 6 — App Features & Live Demo (2 minutes)

Let me show you what the app actually does — I have it live here.

*[Switch to browser — navigate to App URL]*

The app has two pages.

**Page 1 — Live Prediction.** On the sidebar, you see five input sliders: magnitude, depth, azimuthal gap, RMS, and location type. As I drag the magnitude slider — watch the hazard card change in real time. No page reload, no button click. The probability bars update instantly, and the gauge chart tracks the magnitude value.

Let me demo a few scenarios:
- *[Set magnitude to 3.0]* → Green, Low hazard, 99.9% confidence.
- *[Set magnitude to 5.5]* → Yellow, Moderate.
- *[Set magnitude to 7.0]* → Red, High hazard. The card turns red immediately.

**Page 2 — Global Activity.** This pulls live data from USGS — earthquakes from the last 24 hours, plotted on a world map. Each dot is color-coded: green for Low, yellow for Moderate, red for High. You can filter by time window and minimum magnitude. The table below shows the raw data — location, depth, time — all updated every 5 minutes automatically.

The Flask API is also running here — a quick demo:
*[Show curl command or Postman]*
`POST /predict` with a JSON body returns the hazard label, confidence scores, and a hex color code — ready to be consumed by any frontend.

---

## Slide 7 — Challenges, Learnings & Future Work (1.5 minutes)

A few things I want to highlight from this experience.

**Challenges:**

The biggest one was the class imbalance. 7 High records out of 2,000 is less than 0.4%. Standard accuracy would have been meaningless — a model that always predicts "Low" gets 51.6% accuracy and looks fine. That's why I used Macro F1 as my primary metric and weighted the loss function.

I also ran into a macOS-specific issue: port 5000 is blocked by AirPlay Receiver. Had to migrate the Flask API to port 5001. And XGBoost requires the OpenMP library on Mac — `brew install libomp` fixed it.

**Learnings:**

This project gave me end-to-end MLOps experience in a single codebase — from API data collection through model training, REST API serving, interactive frontend, and cloud deployment. Flask-CORS and Streamlit's `cache_data` decorator kept the frontend and backend cleanly separated.

**Future work:**

The most interesting extension would be adding temporal features — aftershock sequences, time since the last event in the same region. That could catch patterns the current model misses. I'd also like to explore a regression version: predict the magnitude itself from early seismic signal features, which has real early-warning applications.

---

## Closing (15 seconds)

The app is live at **earthsafe-eu9o2sytymwqnls48ppjg7.streamlit.app** — the link is on the title slide.
The full code is on GitHub. Thank you — happy to take questions.

---

# Timing Guide
| Slide | Target time |
|-------|-------------|
| 1 Title | 0:30 |
| 2 Overview | 1:30 |
| 3 Data | 2:00 |
| 4 Models | 2:30 |
| 5 Architecture | 1:30 |
| 6 Demo | 2:00 |
| 7 Challenges | 1:30 |
| Closing | 0:15 |
| **Total** | **~11:45** |
