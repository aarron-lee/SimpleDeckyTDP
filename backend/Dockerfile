FROM ghcr.io/steamdeckhomebrew/holo-base:latest

RUN pacman -S base-devel pciutils cmake --noconfirm --needed --overwrite='*'

ENTRYPOINT [ "/backend/entrypoint.sh" ]