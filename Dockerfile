# Use a lightweight Python image
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy dependency list and install requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy your whole project into the container
COPY . .

# Run Alembic migrations then start the CLI app
CMD ["bash", "-c", "alembic upgrade head && python -m app.main"]
