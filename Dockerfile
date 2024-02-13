FROM node:21-bookworm

ENV DEBIAN_FRONTEND=noninteractive \
    USERNAME=appuser \
    APP_PATH=/faucet

RUN apt update && \
    apt -y dist-upgrade && \
    apt install -y --no-install-recommends \
        tzdata \
        ca-certificates  && \
    echo "deb http://deb.debian.org/debian testing main" >> /etc/apt/sources.list && \
    apt update && \
    apt install -y --no-install-recommends -t testing \
      zlib1g \
      libgnutls30 \
      perl-base && \
    rm -rf /var/cache/apt/*

RUN git clone https://github.com/allora-network/allora-faucet.git $APP_PATH && \
    cd $APP_PATH && \
    npm install dependencies

RUN groupadd -g 1001 ${USERNAME} \
    && useradd -m -d ${APP_PATH} -u 1001 -g 1001 ${USERNAME}

EXPOSE 8000

WORKDIR ${APP_PATH}

USER ${USERNAME}
