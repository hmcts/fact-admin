@fact-admin-court-open-access @special
Feature: Court-addresses

  Background:
    When I log in as a super-admin
    When I select Include closed courts

  Scenario Outline: Open
    When I click edit next to court with "<view_court_slug>"
    Then I am redirected to the Edit Court page for the chosen court
    When I select the open checkbox
    And I click the general info save button
    Then a success message is displayed on the general info tab "General Information updated"
    When I unselect the open checkbox
    And I click the general info save button
    Then a success message is displayed on the general info tab "General Information updated"
#
    Examples:
      | view_court_slug                            |
      | birmingham-district-probate-registry       |

  Scenario Outline: Access scheme
    When I click edit next to court with "<view_court_slug>"
    Then I am redirected to the Edit Court page for the chosen court
    When I select the Participates in access scheme checkbox
    And I click the general info save button
    Then a success message is displayed on the general info tab "General Information updated"
    When I unselect the Participates in access scheme checkbox
    And I click the general info save button
    Then a success message is displayed on the general info tab "General Information updated"

    Examples:
      | view_court_slug                            |
      | birmingham-district-probate-registry       |
