FROM node:latest

LABEL tanakorncode <tanakorncode@gmail.com>

# ENV http_proxy=http://proxy.egat.co.th:8080
# ENV https_proxy=http://proxy.egat.co.th:8080

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ENV NODE_ENV production

COPY package*.json /usr/src/app/

RUN npm install
# RUN npm config set https-proxy ${http_proxy} && \
#   npm config set proxy ${http_proxy} && \
#   npm install

COPY .env.production /usr/src/app/.env.production
COPY . /usr/src/app

# TimeZone
ENV TZ=Asia/Bangkok
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

EXPOSE 3001

CMD ["npm","start"]