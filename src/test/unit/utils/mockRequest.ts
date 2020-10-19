
export const mockRequest = (data: any) => {
  const req: any = {
    body: '',
    i18n: {
      getDataByLanguage: '',
    },
  };
  req.body = jest.fn().mockReturnValue(req);
  req.i18n.getDataByLanguage = jest.fn().mockReturnValue(data);
  return req;
};
