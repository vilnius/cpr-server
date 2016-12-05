FROM node:onbuild
ADD . /src
WORKDIR /src
RUN npm set progress=false
RUN npm config set registry https://registry.npmjs.org/
RUN npm install --ignore-scripts --unsafe-perm
