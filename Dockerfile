FROM node:18-alpine
Add . ./
RUN npm install -ci
EXPOSE 3000
CMD ["tsc"]
CMD ["node", "dist/index.js"]