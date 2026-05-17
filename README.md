# AI Auto Data Analyst

An AI-powered analytics tool that lets you query datasets using plain English — no SQL or code required. Built with Python, REST APIs, and Pandas for automated data analysis workflows.

---

## Features

- Natural language querying of datasets via AI prompts
- REST API integration for query processing and response handling
- Automated data analysis workflows using Pandas
- Best design principles and data structures for efficient processing
- Maintainable, scalable code following coding standards and best practices

---

## Tech Stack

| Component | Technology |
|---|---|
| Language | Python |
| Data Processing | Pandas, NumPy |
| API Integration | REST APIs |
| AI Layer | LLM via API |

---

## How it Works

```
User enters natural language query
        ↓
Query sent to AI API via REST endpoint
        ↓
AI interprets query → generates analysis logic
        ↓
Pandas executes data operations on dataset
        ↓
Results returned as structured output / summary
```

---

## How to Run

**Prerequisites:** Python 3.9+

```bash
# Clone the repository
git clone https://github.com/cheelaakhil/ai-auto-data-analyst.git
cd ai-auto-data-analyst

# Install dependencies
pip install -r requirements.txt

# Add your API key
# Create a .env file:
# API_KEY=your_api_key_here

# Run the app
python main.py
```

---

## Example Usage

```
> Analyse this dataset and show me the top 5 categories by revenue
> What is the average age of customers who churned last month?
> Plot a trend of monthly sales for 2025
```

---

## Author

**Cheela Akhil** — [LinkedIn](https://linkedin.com/in/cheelaakhil) · [GitHub](https://github.com/cheelaakhil)
