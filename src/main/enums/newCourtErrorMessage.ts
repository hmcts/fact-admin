export enum newCourtErrorMessage {
  getServiceAreas = 'A problem occurred when retrieving the service areas.',
  addNewCourt = 'A problem occurred when adding the new court.',
  duplicateCourt = 'A court already exists for court provided: ',
  nameEmpty = 'A new court name value is required',
  latitudeEmpty = 'A latitude value is required',
  longitudeEmpty = 'A longitude value is required',
  latitudeInvalid = 'The latitude value needs to be a number',
  longitudeInvalid = 'The longitude value needs to be a number',
  serviceAreaNotSelected = 'At least one service area must be selected',
  nameInvalid = 'Invalid court name: Valid characters are: A-Z, a-z, 0-9, apostrophes, brackets and hyphens'
  }