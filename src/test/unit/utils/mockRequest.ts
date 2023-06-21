
export const mockRequest = () => {
  const req: any = {
    body: '',
    scope: {
      cradle: {

      }
    },
    query: {},
    appSession: {
      user: {
        isSuperAdmin: '',
        sub: 'moshuser'
      }
    }
  };
  req.body = jest.fn().mockReturnValue(req);
  return req;
};
