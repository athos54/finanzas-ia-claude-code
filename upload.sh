rsync -rtlv ./ dg:/root/finanzas/ && \

ssh dg docker-compose -f /root/finanzas/docker-compose.yml down && docker-compose -f /root/finanzas/docker-compose.yml up