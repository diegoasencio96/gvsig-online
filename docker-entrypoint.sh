#python manage.py compilemessages -l es --settings=gvsigol.settings
python manage.py migrate --settings=gvsigol.settings             # Apply database migrations
#python manage.py collectstatic --noinput --settings=gvsigol.settings  # Collect static files
# Start Gunicorn processes
echo Starting Gunicorn.

python manage.py runserver 0.0.0.0:9000