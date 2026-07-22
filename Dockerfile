# Use a lightweight Python image
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy dependency list and install requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy only backend-relevant files
COPY alembic.ini ./
COPY alembic/ ./alembic/
COPY app/ ./app/

# Run Alembic migrations then start the CLI app
CMD ["bash", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
