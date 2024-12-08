FROM node:22

WORKDIR /app

COPY package*.json ./
COPY src ./src
COPY img ./img
COPY tsconfig.json ./

RUN npm install
RUN npm install typescript -g
RUN tsc --listFiles 

CMD ["npm", "start"]