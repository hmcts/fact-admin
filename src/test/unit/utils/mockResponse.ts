
export const mockResponse = () => {
  const res: any = {
    locals: {}
  };
  res.redirect = jest.fn().mockReturnValue(res);
  res.render = jest.fn().mockReturnValue(res);
  res.status = (code: number) => {
    res.statusCode = code;
  };
  res.header = jest.fn().mockReturnValue(res);
  res.attachment = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.response = (message: string) => {
    res.response.data = message;
  };

  return res;
};
