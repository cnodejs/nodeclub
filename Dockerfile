FROM centos:centos7
MAINTAINER jamiesun <jamiesun.net@gmail.com>

VOLUME [ "/etc/nodeclub" ]

RUN yum update -y
RUN yum install -y epel-release
RUN yum install -y gcc make git nodejs npm openssl openssl-devel zip unzip libjpeg-devel libpng-devel
RUN yum clean all

RUN npm install -g n && n stable

RUN git clone -b master https://github.com/cnodejs/nodeclub.git /opt/nodeclub
RUN cd /opt/nodeclub && make install && make build

ADD runclub /usr/local/bin/runclub
RUN chmod +x /usr/local/bin/runclub

EXPOSE 3000

CMD ["/usr/local/bin/runclub"]
