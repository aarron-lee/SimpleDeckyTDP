FROM ghcr.io/steamdeckhomebrew/holo-base:latest

RUN pacman -S base-devel pciutils cmake make clang git --noconfirm --needed --overwrite='*'

ENTRYPOINT [ "/backend/entrypoint.sh" ]