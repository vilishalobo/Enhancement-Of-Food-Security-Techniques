import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error
import requests
import io

# Function to load the dataset from IPFS with fallback gateways
def load_data():
    ipfs_cid = "bafkreif5k5e4vjw3fljabb5orajyztyipkq4petb4levi424mhtywuvnqa"
    gateways = [
        f"https://ipfs.io/ipfs/{ipfs_cid}",
        f"https://cloudflare-ipfs.com/ipfs/{ipfs_cid}",
        f"https://gateway.pinata.cloud/ipfs/{ipfs_cid}"
    ]

    headers = {"User-Agent": "Mozilla/5.0"}  # Helps avoid 403 errors

    for url in gateways:
        try:
            response = requests.get(url, headers=headers, timeout=10)

            if response.status_code == 200:
                print(f"Dataset successfully fetched from {url}")
                return pd.read_csv(io.StringIO(response.text), encoding="utf-8")
            else:
                print(f"Failed at {url}, Status: {response.status_code}")

        except Exception as e:
            print(f"Error fetching from {url}: {e}")

    raise Exception("Failed to fetch dataset from all IPFS gateways")

# Function to preprocess the data (group fruit totals by year)
def preprocess_data(data):
    fruit_columns = [col for col in data.columns if col.lower() != 'year']
    fruit_totals = data.groupby('Year')[fruit_columns].sum().reset_index()
    return fruit_totals, fruit_columns

# Function for data augmentation (Interpolating mid-year points)
def augment_data(X, y_df):
    new_years = np.arange(X.min(), X.max(), 0.5)  # Generating mid-year points
    augmented_data = pd.DataFrame({'Year': np.concatenate([X.flatten(), new_years])})

    for fruit in y_df.columns:
        new_production = np.interp(new_years, X.flatten(), y_df[fruit])
        augmented_data[fruit] = np.concatenate([y_df[fruit], new_production])

    return augmented_data

# Function to train and predict for a specific fruit
def train_and_predict(data, fruit_name, future_years):
    X = data[['Year']].values
    y = data[fruit_name].values

    # Augment data for better accuracy
    augmented_df = augment_data(X, data[[fruit_name]])
    X_aug = augmented_df[['Year']].values
    y_aug = augmented_df[fruit_name].values

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X_aug, y_aug, test_size=0.2, random_state=42)

    # Train the Random Forest model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Predict & evaluate
    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)

    print(f"{fruit_name} - R² Score: {r2:.4f}, MAE: {mae:.2f}")

    # Predict future years
    future_years_df = np.array(future_years).reshape(-1, 1)
    future_predictions = model.predict(future_years_df)

    # Return structured predictions
    return [{"year": int(year), "value": round(pred, 2)} for year, pred in zip(future_years, future_predictions)]
