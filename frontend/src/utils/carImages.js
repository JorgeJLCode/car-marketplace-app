import { API_URL } from '../config';

const CAR_IMAGES = {
  'toyota-corolla-2022': '/cars/toyota-corolla-2022.png',
  'honda-civic-2021': '/cars/honda-civic-2021.png',
  'ford-mustang-2023': '/cars/ford-mustang-2023.png',
  'chevrolet-camaro-2020': '/cars/chevrolet-camaro-2020.png',
  'bmw-serie-3-2022': '/cars/bmw-serie-3-2022.png',
};

const toSlug = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getCarImageUrl = (car) => {
  const explicitImage = car?.imageUrl || car?.image;
  if (explicitImage) {
    if (API_URL && explicitImage.startsWith('/uploads/')) {
      return `${API_URL}${explicitImage}`;
    }

    return explicitImage;
  }

  const key = `${toSlug(car?.brand)}-${toSlug(car?.model)}-${car?.year || ''}`;
  return CAR_IMAGES[key] || '/default_car.png';
};
