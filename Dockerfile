FROM node:18

WORKDIR /app

COPY package*.json ./
COPY src ./ 
COPY img ./
COPY tsconfig.json ./

RUN npm install
RUN npm install typescript -g
RUN tsc

CMD ["npm", "start"]