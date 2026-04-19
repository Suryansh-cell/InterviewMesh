# ML Service Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Train model on startup
RUN cd models && python train_dt.py && cd ..

# Expose port
EXPOSE 5001

# Start Flask app
CMD ["python", "app.py"]
