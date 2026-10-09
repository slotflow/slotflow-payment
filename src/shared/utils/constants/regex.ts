export const objectIdRegex = /^[a-fA-F0-9]{24}$/;

export const descriptionRegex = /^[\w\d\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{10,200}$/;

export const serviceNameRegex = /^[A-Za-z ]{4,50}$/;

export const serviceDescriptionRegex = /^[\w\d !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{10,500}$/;

export const usernameRegex = /^[a-zA-Z ]{4,30}$/;

export const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
