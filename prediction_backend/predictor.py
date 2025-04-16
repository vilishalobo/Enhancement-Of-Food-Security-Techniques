from flask import Flask, jsonify
from flask_cors import CORS
from model import load_data, preprocess_data, train_and_predict

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins

# Future years for prediction
FUTURE_YEARS = [2025]

@app.route('/api/predictions', methods=['GET'])
def get_predictions():
    try:
        # Load dataset from IPFS
        data = load_data()
        print("Dataset loaded successfully!")  # Debugging statement

        # Preprocess data
        fruit_totals, fruit_columns = preprocess_data(data)

        # Generate predictions
        all_predictions = {
            fruit: train_and_predict(fruit_totals, fruit, FUTURE_YEARS)
            for fruit in fruit_columns
        }

        return jsonify({"status": "success", "predictions": all_predictions})

    except Exception as e:
        print(f"Error: {str(e)}")  # Debugging error
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
