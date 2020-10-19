
export const mockResponse = () => {
  const res: any = {
    locals: {}
  };
  res.redirect = jest.fn().mockReturnValue(res);
  res.render = jest.fn().mockReturnValue(res);
  res.status = (code: number) => {
    res.statusCode = code;
  };

  return res;
};
