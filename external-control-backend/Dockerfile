FROM python:3.13-slim

# Install Flask
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application into the image
COPY src/* .

# Tell Flask where to load the application from
ENV FLASK_APP simple_rest_api.py

# Expose Flask's default port
EXPOSE 5000

# Run the REST service
ENTRYPOINT ["flask", "run", "--host", "0.0.0.0", "--port", "5000"]