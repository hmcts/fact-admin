
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
        email: 'moshuser'
      }
    }
  };
  req.body = jest.fn().mockReturnValue(req);
  return req;
};
