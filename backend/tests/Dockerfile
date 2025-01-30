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
ENV DJANGO_TEST=1

RUN python manage.py collectstatic --noinput

# Run the application
CMD ["python", "manage.py", "test"]
