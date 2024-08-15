
Feature: Homepage

  Scenario Outline: Navigate to edit a court or tribunal page
    When I log in as an admin
    When I select Include closed courts
    Then I can view the courts or tribunals in a list format
    And they are in alphabetical order
    When I click edit next to court with "<edit_court_slug>"
    Then I am redirected to the Edit Court page for the "<edit_court_name>"

    Examples:
      | edit_court_slug                            | edit_court_name         |
      | shrewsbury-crown-court                     | Shrewsbury Crown Court  |

  Scenario Outline: Navigate to view court or tribunal page
    When I log in as an admin
    When I select Include closed courts
    When I click view next to court with "<view_court_slug>"
    Then I am redirected to the View Court page for the "<view_court_name>"

    Examples:
      | view_court_slug                            | view_court_name        |
      | shrewsbury-crown-court                     | Shrewsbury Crown Court |
