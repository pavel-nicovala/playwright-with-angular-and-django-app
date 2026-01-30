FROM python:3.12-slim

WORKDIR /app

# Install sqlite3
RUN apt-get update && apt-get install -y --no-install-recommends sqlite3 \
  && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application files
COPY backend/ .

# Expose the backend port and run the application
EXPOSE 8000

# Run migrations and start the application
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
