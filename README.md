# 🧠 AlzPredict AI — Enterprise Cognitive Intelligence Suite

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=10,15,35&height=220&section=header&text=AlzPredict%20AI&fontSize=70&fontColor=fff&animation=twinkling&fontAlignY=35&desc=Advanced%20Clinical%20Recourse%20%7C%20WebGL%20%2B%20FastAPI%20%2B%20XGBoost&descSize=18&descAlignY=60" width="100%"/>

<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Outfit&size=22&duration=2500&pause=800&color=00F5FF&center=true&vCenter=true&multiline=true&repeat=true&width=900&height=90&lines=Elite+Clinical+Inference+Suite+%E2%9C%A8;WebGL+Scroll+Parallax+%2B+Immersive+Depth+%F0%9F%8C%8C;Algorithmic+Recourse+%2B+Partial+Dependence+%F0%9F%A7%A0;AUC+0.99+%7C+94.0%25+Model+Certification+%F0%9F%8E%96" alt="Typing SVG" />
</a>

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-FFFFFF?style=for-the-badge&logo=threedotjs&logoColor=black)](https://threejs.org)
[![Tailwind v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-v11-F08?style=for-the-badge&logo=framer&logoColor=white)](https://framer.com)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.x-FF6600?style=for-the-badge&logo=xgboost&logoColor=white)](https://xgboost.readthedocs.io)

<br/>

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                  🏆  PRODUCTION SYSTEM CERTIFICATION                    │
├─────────────────────────────────────────────────────────────────────────┤
│  XGBoost Manifold    │ Accuracy: 93.86% │ F1-Macro: 0.9375 │ AUC: 0.991 │
│  Conformal Level     │ 90.0% Statistical Coverage Guarantee (Mapie)    │
│  Client Ecosystem    │ 3D Real-Time Responsive Rendering Interface     │
└─────────────────────────────────────────────────────────────────────────┘
```

</div>

---

## 🗂 Table of Contents

<details open>
<summary><b>Navigate</b></summary>

- [✨ Core Advancements](#-core-advancements)
- [🏗 System Architecture](#-system-architecture)
- [🌐 High-Fidelity Interface](#-high-fidelity-interface)
- [🧠 Mathematical Engine](#-mathematical-engine)
- [🚀 Installation & Deployment](#-installation--deployment)
- [📁 Repository Topology](#-repository-topology)
- [📊 Statistical Performance](#-statistical-performance)
- [🛠 Core Tech Stack](#-core-tech-stack)

</details>

---

## ✨ Core Advancements

AlzPredict AI has been architected to exceed standard ML projects by deploying sophisticated production features valued by enterprise clinical and engineering teams:

*   **🌌 3D Spatial Physics Engine:** Integrated React-Three-Fiber global context tracking viewport scroll positions to control orbital speed, dust particles, and camera depth.
*   **⚡ Microservices Mesh:** Replaced standard monolithic workflows with a robust decoupling between a High-Speed **FastAPI inference engine** and a static-rendered **Next.js web client**.
*   **🔮 Algorithmic Recourse (Counterfactuals):** A real-time greedy hill-climbing optimizer that mathematically identifies the exact clinical changes required to toggle a patient’s classification state from "Demented" back to "Normal".
*   **📊 Interaction Topography (PDP Matrix):** Exposes real-time, dynamic 15x15 Partial Dependence heatmaps showing the joint statistical interaction surfaces of any 2 user-selected features.
*   **🛡️ Inductive Conformal Guarantees:** Built using Mapie 1.4 to ensure prediction sets possess non-asymptotic distribution-free frequentist coverage &ge; 90%.

---

## 🏗 System Architecture

```text
                    ┌──────────────────────────────────────────┐
                    │          Next.js 15 Client UI            │
                    │      (React Three Fiber + Tailwind)      │
                    └────────────────────┬─────────────────────┘
                                         │
                                   HTTP REST API
                                         │
                    ┌────────────────────▼─────────────────────┐
                    │           FastAPI Gateway Core           │
                    │            (Python 3.10+)                │
                    └─────┬──────────────┬──────────────┬──────┘
                          │              │              │
                 ┌────────▼─────┐ ┌──────▼──────┐ ┌─────▼────────┐
                 │ /api/predict │ │ /api/explain│ │ /api/recourse│
                 └────────┬─────┘ └──────┬──────┘ └─────┬────────┘
                          │              │              │
                          └──────────────┼──────────────┘
                                         │
                    ┌────────────────────▼─────────────────────┐
                    │        XGBoost Regularized Manifold      │
                    │    (L1 + L2 penalties, Optuna Tuned)     │
                    └──────────────────────────────────────────┘
```

---

## 🌐 High-Fidelity Interface

The user interface transitions seamlessly between clean mathematical analysis and deep scientific insight:

| Interface Module | Feature Highlights | Technologies Used |
| :--- | :--- | :--- |
| **Clinical Intake Wizard** | 3-step intake container with slide animations, animated population distribution curves next to every biometric slider. | `framer-motion`, standard SVG paths |
| **Analytical Hub** | SHAP Lollipop distribution, algorithmic recourse timeline comparison, and real-time PDP heat matrices. | `Recharts`, CSS Grid Mesh |
| **Academic Disclosure** | Technical publication disclosure containing LaTeX objective rendering and Dataset topology summaries. | `Lucide Icons`, Flex Grid |

---

## 🧠 Mathematical Engine

### 01 / Extreme Gradient Boosting Objective
The base estimator regularizes heavily over high-dimensional data splits:
$$L(\theta) = \sum_{i} l(y_i, \hat{y}_i) + \sum_{k} \Omega(f_k)$$
Where the complexity penalty satisfies $\Omega(f) = \gamma T + \frac{1}{2}\lambda||w||^2$ monitoring active leaf counts ($T$) and continuous vector magnitude ($w$).

### 02 / Inductive Conformal Certificate
Instead of uncalibrated soft-maximum outputs, conformal classifiers determine certified valid predictive arrays guaranteeing coverage:
$$P \left( Y_{n+1} \in C(X_{n+1}) \right) \ge 1 - \alpha$$

---

## 🚀 Installation & Deployment

To run the immersive environment locally, two separate terminals are required:

### 🔧 Phase 1: Python ML Back-End
```bash
# 1. Create secure environment
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# 2. Install analytics layer
pip install -r requirements.txt

# 3. Launch fast gateway
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
> REST interface successfully initialized at **`http://localhost:8000`**. View auto-documentation at `/docs`.

### 💻 Phase 2: Static Next.js Web Portal
```bash
# 1. Route to app
cd alzpredict-web

# 2. Install visual engine
npm install

# 3. Deploy dev context
npm run dev
```
> Dashboard context compiles successfully at **`http://localhost:3000`**.

---

## 📁 Repository Topology

```text
alzpredict/
├── 🌐 app/
│   └── main.py                 # REST Gateway (Predict, Recourse, PDP)
├── 💻 alzpredict-web/
│   ├── src/
│   │   ├── app/
│   │   │   ├── diagnostic/    # Intake Wizard Workspace
│   │   │   ├── explain/       # SHAP/PDP Analysis Hub
│   │   │   └── science/       # Technical Publication page
│   │   └── components/
│   │       ├── ClientProvider # Lazy Load Context
│   │       └── ImmersiveBg    # WebGL Parallax Dust Scene
├── 🐍 src/
│   ├── preprocess.py          # Data topology processing
│   ├── train_model.py         # SMOTE + Optuna Bayesian loops
│   └── conformal_prediction.py# MAPIE inductive sets
└── 📊 data/                   # Static data assets
```

---

## 📊 Statistical Performance

| Model Architecture | Validation Accuracy | F1-Macro (5-Fold) | ROC-AUC |
| :--- | :--- | :--- | :--- |
| 🚀 **XGBoost Regularized** | **93.86%** | **0.938** | **0.991** |
| 🌳 Random Forest | 93.86% | 0.938 | 0.993 |
| 📈 Logistic Baseline | 71.90% | 0.711 | 0.926 |

---

## 🛠 Core Tech Stack

<table width="100%">
  <tr>
    <td width="33%"><b>Client Architecture</b></td>
    <td width="33%"><b>Inference Tier</b></td>
    <td width="34%"><b>ML Platform</b></td>
  </tr>
  <tr>
    <td>
      <ul>
        <li>Next.js 15</li>
        <li>React 19</li>
        <li>Tailwind CSS v4</li>
        <li>React Three Fiber</li>
        <li>Framer Motion</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>FastAPI 0.109</li>
        <li>Uvicorn</li>
        <li>Pydantic v2</li>
        <li>JSON-Serialization</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>XGBoost 2.x</li>
        <li>MAPIE (Conformal)</li>
        <li>SHAP (TreeExplainer)</li>
        <li>Optuna (Bayesian)</li>
        <li>Scikit-Learn</li>
      </ul>
    </td>
  </tr>
</table>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=10,15,35&height=120&section=footer" width="100%"/>

**💫 AlzPredict AI: Bridging Statistical Mathematics and Immersive Clinical Intelligence.**

</div>
