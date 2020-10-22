
export const mockRequest = () => {
  const req: any = {
    body: '',
  };
  req.body = jest.fn().mockReturnValue(req);
  return req;
};
