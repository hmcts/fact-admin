
Feature: Homepage

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am logged out if I am a viewer user
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials
    And click the Sign In button
    When I select Include closed courts

  Scenario: View the list

    Then I can view the courts or tribunals in a list format
    And they are in alphabetical order

  Scenario Outline: Navigate to edit a court or tribunal page
    When I click edit next to court with "<edit_court_slug>"
    Then I am redirected to the Edit Court page for the "<edit_court_name>"

    Examples:
      | edit_court_slug                            | edit_court_name         |
      | shrewsbury-crown-court                     | Shrewsbury Crown Court  |

  Scenario Outline: Navigate to view court or tribunal page
    When I click view next to court with "<view_court_slug>"
    Then I am redirected to the View Court page for the "<view_court_name>"

    Examples:
      | view_court_slug                            | view_court_name        |
      | shrewsbury-crown-court                     | Shrewsbury Crown Court |
