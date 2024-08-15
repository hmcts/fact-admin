Feature: User Login/Logout

  Scenario Outline: Login Unsuccessful
    Given I am on FACT homepage '/'
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my incorrect authenticated credentials "<username>" "<password>"
    And click the Sign In button
    Then an error message is shown

    Examples:
      | username              | password        |
      | wrong-email@gmail.com | wrongPa55word11 |

  Scenario: Login Successful
    When I log in as a super-admin
    And click the Sign In button
    Then the system will sign me in
