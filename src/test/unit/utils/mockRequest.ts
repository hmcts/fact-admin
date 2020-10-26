
export const mockRequest = () => {
  const req: any = {
    body: '',
    scope: {
      cradle: {

      }
    }
  };
  req.body = jest.fn().mockReturnValue(req);
  return req;
};
