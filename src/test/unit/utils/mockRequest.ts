
export const mockRequest = () => {
  const req: any = {
    body: '',
    scope: {
      cradle: {

      }
    },
    query: {},
    session: {
      user: {
        roles: []
      }
    }
  };
  req.body = jest.fn().mockReturnValue(req);
  return req;
};
