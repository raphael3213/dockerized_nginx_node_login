# dockerized_nginx_node_login


To get the app working , run the following commands:


sudo docker-compose down
sudo docker-compose up --build 


Please make sure to stop any process on port 27017, before starting the app.


Nginx and nodejs clusters are used to run the api. To run a single instance run:

node app/app.js
