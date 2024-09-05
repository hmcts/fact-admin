Feature: Opening Types List

  Scenario: Edit Opening Type
    When I log in as a super-admin
    When I click on lists link
    Then I am redirected to the "Edit A List" page
    When I hover over the tab title
    And I click on Opening type list
    Given I click edit opening type "Court open"
    Then I am redirected to the opening type "Editing Opening Type: Court open" form
    Then I will make sure to clear entries for the opening Type
    Then I enter "Court open" in opening type name textbox
    Then I enter "Oriau agor y Llys" in opening type welsh name textbox
    When I click Opening Type save button
    Then A green message is displayed for the updated Opening Type "Opening Types Updated"

  Scenario: Add new Opening Type with the name already exist
    When I log in as a super-admin
    When I click on lists link
    Then I am redirected to the "Edit A List" page
    When I hover over the tab title
    And I click on Opening type list
    Then I click on Add new Opening Type
    Then I am redirected to the opening type "Add New Opening Type" form
    Then I enter "Court open" in opening type name textbox
    When I click Opening Type save button
    Then The error message displays for a Opening type "A opening type with the same name already exists."

  Scenario: Deleting new Opening Type
    When I log in as a super-admin
    When I click on lists link
    Then I am redirected to the "Edit A List" page
    When I hover over the tab title
    And I click on Opening type list
    Then I will make sure there is no test entry "TEST 123" in the list "#openingTypesListContent"
    Then I click on Add new Opening Type
    Then I am redirected to the opening type "Add New Opening Type" form
    Then I enter "TEST 123" in opening type name textbox
    When I click Opening Type save button
    Then A green message is displayed for the updated Opening Type "Opening Types Updated"
    Then I click "TEST 123" delete Opening type button
    Then I am redirected to the opening type "Delete Opening Type: TEST 123" form
    When I click confirm delete button
    Then A green message is displayed for the updated Opening Type "Opening Types Updated"

  Scenario: Deleting existing opening Type
    When I log in as a super-admin
    When I click on lists link
    Then I am redirected to the "Edit A List" page
    When I hover over the tab title
    And I click on Opening type list
    Then I click "Court open" delete Opening type button
    Then I am redirected to the opening type "Delete Opening Type: Court open" form
    When I click confirm delete button
    Then The error message displays for a Opening type "You cannot delete this opening type at the moment, as one or more courts are dependent on it. Please remove the opening from the relevant courts first."

  Scenario: Editing opening type with the name already exist
    When I log in as a super-admin
    When I click on lists link
    Then I am redirected to the "Edit A List" page
    When I hover over the tab title
    And I click on Opening type list
    Given I click edit opening type "Court open"
    Then I am redirected to the opening type "Editing Opening Type: Court open" form
    Then I will make sure to clear entries for the opening Type
    Then I enter "County Court open" in opening type name textbox
    When I click Opening Type save button
    Then The error message displays for a Opening type "A opening type with the same name already exists."
