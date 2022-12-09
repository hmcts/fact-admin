@fact-admin-tab-local-authorities
Feature: Local authorities

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    Then I am logged out if I am an admin user
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I select Include closed courts

  Scenario Outline: Local authorities updated successfully

    When I click edit next to court with "<view_court_slug>"
    And I am redirected to the Edit Court page for the chosen court
    And I hover over types nav element
    And I click the types tab
    When I check code errors
    And I will make sure Family court type is selected
    And I click on save court type
    And I hover over local authorities nav element
    And I click the local authorities tab
    And I select area of law "Adoption"
    And I select 'Barking and Dagenham Borough Council'
    And I click on local authorities save button
    Then Success message is displayed for local authorities with summary "Local authorities updated"

    Examples:
      | view_court_slug                            |
      | birmingham-civil-and-family-justice-centre |

  Scenario Outline: When there are no area of law selected for the chosen court user should get proper error message when he clicks on local authorities

    When I click edit next to court with "<view_court_slug>"
    And I am redirected to the Edit Court page for the chosen court
    And I hover over types nav element
    And I click the types tab
    When I check code errors
    And I will make sure Family court type is selected
    And I click on save court type
    When I hover over opening hours nav element
    When I click the cases heard tab
    And I make sure there is no area of law selected
    And And I click on update cases heard
    And I hover over local authorities nav element
    And I click the local authorities tab
    Then An error is displayed for local authorities with title "There is a problem" and summery "You need to enable relevant family court areas of law"

    Examples:
      | view_court_slug      |
      | administrative-court |

  Scenario Outline: When Family court type is not selected for the chosen court local authorities tab should be disabled for the user.

    When I click edit next to court with "<view_court_slug>"
    Then I am redirected to the Edit Court page for the chosen court
    And I hover over types nav element
    And I click the types tab
    When I check code errors
    And I will make sure Family court type is not selected
    And I click on save court type
    And I hover over local authorities nav element
    Then The local authorities tab should be disabled

    Examples:
      | view_court_slug          |
      | administrative-court     |
