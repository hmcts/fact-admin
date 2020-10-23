Feature: Login/Logout

  Background:
    Given I am on new browser
    And I am on FACT homepage

  Scenario Outline: Login Unsuccessful
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials "<username>" "<password>"
    And click the Sign In button
    Then an error message is shown

    Examples:
      | username              | password        |
      | wrong-email@gmail.com | wrongPa55word11 |

  Scenario Outline: Login Successful
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials "<username>" "<password>"
    And click the Sign In button
    Then the system will sign me in

    Examples:
      | username             | password   |
      | hmcts.fact@gmail.com | Pa55word11 |
