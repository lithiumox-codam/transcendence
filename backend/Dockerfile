FROM python:3.13-slim

WORKDIR /app

# Copy dependencies file
COPY requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

EXPOSE 8000

# Force python to run in unbuffered mode
ENV PYTHONUNBUFFERED 1

RUN python manage.py collectstatic --noinput

# Run the application
ENTRYPOINT ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
