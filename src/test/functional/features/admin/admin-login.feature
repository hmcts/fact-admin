Feature: Login/Logout

  Background:
    Given I am on new browser
    And I am on FACT homepage
    Then I am logged out if I am a super admin

  Scenario Outline: Login Unsuccessful

    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my incorrect authenticated credentials "<username>" "<password>"
    And click the Sign In button
    Then an error message is shown

    Examples:
      | username              | password        |
      | wrong-email@gmail.com | wrongPa55word11 |

  Scenario: Login Successful
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials
    And click the Sign In button
    Then the system will sign me in

  Scenario: Login with test user with no roles
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with test user credentials with no role
    And click the Sign In button
    Then an error message is shown "You are currently unable to view any courts as you do not have the relevant permissions required. You will need to submit a ServiceNow ticket on the HMCTS IT portal, using the “Report an IT Issue” option. Alternatively, you can call the IT help desk on 0203 989 6060."
