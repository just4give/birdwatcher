FROM balenalib/%%BALENA_MACHINE_NAME%%-debian:stretch-run

# Defines our working directory in container
WORKDIR /usr/src/app

RUN install_packages wget nginx nginx-light




RUN rm -rf /usr/share/nginx/html/*
COPY ./app/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]