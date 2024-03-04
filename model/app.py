from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import model_from_json
import matplotlib as plt
import numpy as np
from PIL import Image
from io import BytesIO
import os

app = Flask(__name__)
CORS(app)

def load_model(model_path, weights_path):
    with open(model_path, 'r') as json_file:
        loaded_model_json = json_file.read()
        loaded_model = model_from_json(loaded_model_json)
        loaded_model.load_weights(weights_path)

    print("Model loaded successfully")
    return loaded_model

current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, 'emotion_model.json')
weights_path = os.path.join(current_dir, 'emotion_model.h5')
model = load_model(model_path, weights_path)

def preprocess_image(image):
    image = image.convert('L')
    resized_image = image.resize((48, 48))

    image_array = np.asarray(resized_image)
    normalized_image_array = (image_array.astype(np.float32) / 255.0)

    normalized_image_array=np.expand_dims(normalized_image_array, axis=0)
    normalized_image_array=np.expand_dims(normalized_image_array, axis=-1)
    return normalized_image_array

@app.route('/classify', methods=['POST'])
def classify_image():
    if request.method == 'POST':
        if 'image' not in request.files:
            return jsonify({'error': 'No file part'})

        file = request.files['image']

        if file.filename == '':
            return jsonify({'error': 'No selected file'})
        if file:
            img = Image.open(BytesIO(file.read()))
            processed_img = preprocess_image(img)
            prediction = model.predict(processed_img)
            classes = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad','surprise']

            index = np.argmax(prediction)
            predicted_class = classes[index]

            return jsonify({'prediction': predicted_class})

    return jsonify({'error': 'Invalid request'})

if __name__ == '__main__':
    app.run(port=8000)