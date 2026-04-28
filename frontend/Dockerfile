FROM nginx:alpine

# Create a temporary build directory
WORKDIR /tmp/build

# Copy only the necessary files
COPY index.template.html .
COPY config.template.json .
COPY css/ ./css/
COPY img/ ./img/
COPY js/ ./js/
COPY locales/ ./locales/

# Copy public assets to nginx html directory (except templates)
RUN cp -r css img js locales /usr/share/nginx/html/

WORKDIR /usr/share/nginx/html

# The CMD replaces variables in templates and starts nginx
CMD ["/bin/sh", "-c", "envsubst < /tmp/build/config.template.json > /usr/share/nginx/html/config.json && envsubst < /tmp/build/index.template.html > /usr/share/nginx/html/index.html && nginx -g 'daemon off;'"]